import {
  Tag,
  UserCog,
  Cog,
  LifeBuoy,
  Send,
  LayoutDashboard,
  Building2,
} from "lucide-react";

function chartNoAxesCombines() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 16v5" />
      <path d="M16 14v7" />
      <path d="M20 10v11" />
      <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" />
      <path d="M4 18v3" />
      <path d="M8 14v7" />
    </svg>
  );
}

export const sidebarData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tablero",
      icon: LayoutDashboard,
      disabled: true,
      items: [
        {
          title: "Seguimiento",
          url: "/tablero",
        },
      ],
    },
    {
      title: "Reservas",
      icon: Tag,
      items: [
        {
          title: "Listado",
          url: "/reservas",
        },
        {
          title: "Añadir reserva",
          url: "/reservas/carga-1",
        },
      ],
    },
    {
      title: "Departamentos",
      icon: Building2,
      items: [
        {
          title: "Listado",
          url: "/departamentos",
        },
      ],
    },
    {
      title: "Reportes",
      icon: chartNoAxesCombines,
      items: [
        {
          title: "Listado",
          url: "/reportes",
        },
      ],
    },
    {
      title: "Gestión de usuarios",
      icon: UserCog,
      items: [
        {
          title: "Listado",
          url: "/gestionUsuarios",
        },
      ],
    },
    {
      title: "Configuración",
      url: "/configuracion",
      disabled: true,
      icon: Cog,
      // items: [
      //   {
      //     title: "General",
      //     url: "#",
      //   },
      //   {
      //     title: "Team",
      //     url: "#",
      //   },
      //   {
      //     title: "Billing",
      //     url: "#",
      //   },
      //   {
      //     title: "Limits",
      //     url: "#",
      //   },
      // ],
    },
  ],
  // navSecondary: [
  //   {
  //     title: "Support",
  //     url: "#",
  //     icon: LifeBuoy,
  //   },
  //   {
  //     title: "Feedback",
  //     url: "#",
  //     icon: Send,
  //   },
  // ],
};
