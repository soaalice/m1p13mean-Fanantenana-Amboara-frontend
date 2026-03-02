import { UserRole } from '../models/user';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** isActive */
  exact?: boolean;
  roles: UserRole[];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]:    'Administrateur',
  [UserRole.BOUTIQUE]: 'Gérant de boutique',
  [UserRole.ACHETEUR]: 'Client',
};

export const NAV_ITEMS: NavItem[] = [
  // ── Admin ─────────────────────────────────────────────────────────────────
  { label: 'Tableau de bord',  icon: 'dashboard',      route: '/admin/dashboard',             exact: true,  roles: [UserRole.ADMIN] },
  { label: 'Boxes',            icon: 'inventory_2',    route: '/admin/boxes',                 exact: false, roles: [UserRole.ADMIN] },
  { label: 'Types de produit', icon: 'category',       route: '/admin/product-types',         exact: false, roles: [UserRole.ADMIN] },
  { label: 'Boutiques',        icon: 'storefront',     route: '/admin/shops',                 exact: false, roles: [UserRole.ADMIN] },
  { label: 'Utilisateurs',     icon: 'people',         route: '/admin/users',                 exact: false, roles: [UserRole.ADMIN] },
  { label: 'Calendrier',       icon: 'calendar_month', route: '/admin/transactions-calendar', exact: false, roles: [UserRole.ADMIN] },
  { label: 'Mot de passe',     icon: 'lock',           route: '/admin/change-password',       exact: false, roles: [UserRole.ADMIN] },

  // ── Boutique ──────────────────────────────────────────────────────────────
  { label: 'Tableau de bord',  icon: 'dashboard',      route: '/boutique/dashboard',          exact: true,  roles: [UserRole.BOUTIQUE] },
  { label: 'Ma boutique',      icon: 'storefront',     route: '/boutique/my-shop',            exact: false, roles: [UserRole.BOUTIQUE] },
  { label: 'Mes produits',     icon: 'inventory_2',    route: '/boutique/my-product',         exact: false, roles: [UserRole.BOUTIQUE] },
  { label: 'Mes commandes',    icon: 'receipt_long',   route: '/boutique/my-command',         exact: false, roles: [UserRole.BOUTIQUE] },
  { label: 'Mot de passe',     icon: 'lock',           route: '/boutique/change-password',    exact: false, roles: [UserRole.BOUTIQUE] },
  { label: 'Mes coupons',      icon: 'local_offer',    route: '/boutique/my-coupon',          exact: false, roles: [UserRole.BOUTIQUE] },

  // ── Acheteur ──────────────────────────────────────────────────────────────
  { label: 'Accueil',          icon: 'home',           route: '/acheteur',                    exact: true,  roles: [UserRole.ACHETEUR] },
  { label: 'Produits',         icon: 'shopping_bag',   route: '/acheteur/product',            exact: false, roles: [UserRole.ACHETEUR] },
  { label: 'Offres spéciales', icon: 'local_offer',    route: '/acheteur/coupons',            exact: false, roles: [UserRole.ACHETEUR] },
  { label: 'Transactions',     icon: 'receipt_long',   route: '/acheteur/transactions',       exact: false, roles: [UserRole.ACHETEUR] },
];

/**
 * Returns the subset of NAV_ITEMS visible to the given role.
 * Pass `null` to get an empty array (unauthenticated users).
 */
export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
