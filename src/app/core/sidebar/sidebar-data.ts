import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Inicio',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-dashboard',
    route: 'home/',
  },
  {
    navCap: 'Mantenimientos',
  },
  {
    displayName: 'Usuario',
    iconName: 'list',
    route: 'home/user',
  },
  {
    displayName: 'Centro',
    iconName: 'layout-navbar-expand',
    route: 'home/center',
  },
  {
    displayName: 'Material',
    iconName: 'box',
    route: 'home/material',
  },
  {
    displayName: 'Historial de Canje',
    iconName: 'checkup-list',
    route: 'home/material-exchange',
  },
  {
    displayName: 'Gestión de materiales',
    iconName: 'ticket',
    route: 'home/exchanging',
  },
  {
    navCap: 'Autenticación',
  },
  {
    displayName: 'Login',
    iconName: 'lock',
    route: '/authentication/login',
  },
  {
    displayName: 'Registro',
    iconName: 'user-plus',
    route: '/authentication/register',
  }
];
