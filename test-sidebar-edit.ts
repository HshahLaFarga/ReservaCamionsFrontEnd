
// Start of Interfaces (Copied from models)

interface Rol {
    rol_id: number;
    nombre: string;
    descripcion: string;
}

interface Profile {
    id?: string;
    nombre: string;
    apellidos?: string;
    username: string;
    contraseña: string;
    email: string;
    password?: string;
    NIF?: string;
    tel1?: number;
    rol_id?: number;
    idioma?: 'es' | 'en' | 'fr' | 'cat';
    roles?: Rol[];
    rolesFormated?: string;
}

interface SidebarItem {
    label: string;
    route?: string;
    icon?: string;
    children?: SidebarItem[];
    admin?: boolean;
    instancia?: string[];
}

interface LoggedProfile {
    instance: 'usuario';
    user: Profile;
    logged: boolean;
}

interface Carrier { }
interface Provider { }
interface Entidad { }

interface LoggedEntidad {
    instance: 'entidad';
    user: Entidad;
    logged: boolean;
    proveedor?: Provider | null;
    transportista?: Carrier | null;
}

type LoggedUser = LoggedProfile | LoggedEntidad;


// End of Interfaces

// Mocking Injectable to avoid Angular dependency
function Injectable(config: any) {
    return function (target: any) { };
}

// SidebarService Class (Copied from source with mods)
@Injectable({ providedIn: 'root' })
class SidebarService {
    private items: SidebarItem[] = [
        {
            label: 'BOOKING_PAGE.TITLE',
            route: '/bookings',
            icon: 'event_available',
        },
        { label: 'CALENDARIO', route: '/calendar', icon: 'calendar_month', },
        { label: 'Proveedores', route: '/provider', icon: 'business' },
        { label: 'Transportistas', route: '/transportista', icon: 'local_shipping' },
        { label: 'Informes', route: '/report', icon: 'bar_chart' },
        { label: 'Materiales', route: '/materials', icon: 'inventory' },
        {
            label: 'Muelles',
            children: [
                { label: 'Muelles', route: '/muelles', icon: 'integration_instructions' },
                { label: 'Horario Muelles', route: '/muelles/timing', icon: 'schedule' },
            ],
            icon: 'warehouse'
        },
        { label: 'Restricciones', route: '/restrictions', icon: 'block' },
        { label: 'Bloqueos', admin: true, icon: 'lock' }, // Simplified for test
    ];

    private EntidadItems: SidebarItem[] = [];

    getSidebarItems(user: LoggedUser | null): SidebarItem[] {
        if (!user) return [];

        if (user.instance === 'entidad') {
            return this.EntidadItems;
        }

        if (user.instance === 'usuario') {
            const userProfile = user.user;

            const roleId = userProfile.rol_id;
            // Roles: 2 = View, 3 = Edit
            const isViewRole = roleId === 2;
            const isEditRole = roleId === 3;

            if (isViewRole || isEditRole) {
                // Base allowed items (for View role)
                const allowedRoutes = ['/bookings', '/calendar', '/provider'];
                const allowedLabels = ['Bloqueos'];

                // Additional items for Edit role
                if (isEditRole) {
                    allowedRoutes.push('/transportista', '/report');
                }

                return this.items.filter(item => {
                    if (item.route && allowedRoutes.includes(item.route)) {
                        return true;
                    }
                    if (allowedLabels.includes(item.label)) {
                        return true;
                    }
                    return false;
                });
            }
        }

        return this.items;
    }
}

// Test Logic

const service = new SidebarService();

console.log('--- TEST START ---');

const viewUser: LoggedProfile = {
    instance: 'usuario',
    logged: true,
    user: {
        nombre: 'View',
        username: 'view',
        contraseña: 'x',
        email: 'x',
        rol_id: 2
    }
};

const editUser: LoggedProfile = {
    instance: 'usuario',
    logged: true,
    user: {
        nombre: 'Edit',
        username: 'edit',
        contraseña: 'x',
        email: 'x',
        rol_id: 3
    }
};


// Case 1: View Role (rol_id = 2)
const itemsView = service.getSidebarItems(viewUser);
console.log('Items for View role (ID 2):');
itemsView.forEach(i => console.log(' - ' + i.label));

const expectedView = ['BOOKING_PAGE.TITLE', 'CALENDARIO', 'Proveedores', 'Bloqueos'];
const actualView = itemsView.map(i => i.label);
// (Note: 'Bloqueos' is handled by label, others by route)

// Case 2: Edit Role (rol_id = 3)
const itemsEdit = service.getSidebarItems(editUser);
console.log('\nItems for Edit role (ID 3):');
itemsEdit.forEach(i => console.log(' - ' + i.label));

const expectedEditRoutes = ['/bookings', '/calendar', '/provider', '/transportista', '/report'];
const actualEditRoutes = itemsEdit.map(i => i.route).filter(r => r);

const hasTransportista = itemsEdit.some(i => i.route === '/transportista');
const hasReport = itemsEdit.some(i => i.route === '/report');
const hasBloqueos = itemsEdit.some(i => i.label === 'Bloqueos');

if (hasTransportista && hasReport && hasBloqueos) {
    console.log('✅ PASS: Edit role has Transportistas, Informes, and Bloqueos.');
} else {
    console.log('❌ FAIL: Edit role missing items.');
}

if (itemsEdit.length === itemsView.length + 2) {
    console.log('✅ PASS: Edit role has exactly 2 more items than View role.');
} else {
    console.log(`❌ FAIL: Count mismatch. View: ${itemsView.length}, Edit: ${itemsEdit.length}`);
}


console.log('--- TEST END ---');
