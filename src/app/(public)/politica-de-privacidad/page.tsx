export default function Page() {
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">
          Política de Privacidad de Cambacuá
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Última actualización: 30 de junio de 2025
        </p>

        <h2 className="text-xl font-semibold mb-2">1. ¿Quiénes somos?</h2>
        <p className="mb-6">
          Cambacuá es una plataforma para la gestión de reservas de
          departamentos y seguimiento de tareas internas. Es administrada por
          Tamara Cergneux en Argentina. Esta política explica cómo tratamos los
          datos personales de quienes usan el sistema.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          2. ¿Qué datos recopilamos?
        </h2>
        <ul className="list-disc list-inside mb-6">
          <li>Nombre y apellido</li>
          <li>Correo electrónico</li>
          <li>Imagen de perfil</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          3. ¿Para qué usamos tus datos?
        </h2>
        <p className="mb-2">Usamos los datos para:</p>
        <ul className="list-disc list-inside mb-6">
          <li>Darte acceso al sistema</li>
          <li>Mejorar el funcionamiento de la plataforma</li>
          <li>Comunicarnos con vos si es necesario</li>
        </ul>
        <p className="mb-6 font-medium text-gray-700">
          No vendemos ni compartimos tus datos con fines comerciales.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          4. ¿Con quién compartimos tu información?
        </h2>
        <p className="mb-2">Solo con:</p>
        <ul className="list-disc list-inside mb-6">
          <li>Supabase (plataforma de backend segura)</li>
          <li>Google (para autenticación con tu cuenta)</li>
          <li>Autoridades legales si la ley lo requiere</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
        <p className="mb-6">
          Usamos cookies necesarias para el funcionamiento básico del sistema,
          como mantener tu sesión iniciada.{" "}
          <strong>No usamos cookies de publicidad.</strong>
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Tus derechos</h2>
        <p className="mb-6">
          Podés pedir acceso, modificación o eliminación de tus datos
          escribiendo a
          <a
            href="mailto:cambacua@ejemplo.com"
            className="text-blue-600 underline">
            cambacua@ejemplo.com
          </a>
          o al
          <a
            href="https://wa.me/5491157479361"
            target="_blank"
            className="text-blue-600 underline">
            +54 9 11 5747 9361
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Seguridad</h2>
        <p className="mb-6">
          Protegemos tus datos con medidas técnicas adecuadas. Te recomendamos
          no compartir tu contraseña y cerrar sesión al terminar.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Cambios</h2>
        <p className="mb-6">
          Podemos actualizar esta política. La versión más reciente estará
          siempre disponible en el sitio.
        </p>

        <h2 className="text-xl font-semibold mb-2">9. Contacto</h2>
        <p className="mb-1">Por dudas o reclamos:</p>
        <p className="mb-1">
          Correo:{" "}
          <a
            href="mailto:cambacua@ejemplo.com"
            className="text-blue-600 underline">
            cambacua@ejemplo.com
          </a>
        </p>
        <p>
          WhatsApp:{" "}
          <a
            href="https://wa.me/5491157479361"
            target="_blank"
            className="text-blue-600 underline">
            +54 9 11 5747 9361
          </a>
        </p>
      </section>
    </>
  );
}
