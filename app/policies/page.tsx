"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PoliciesPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;

    if (!section || !title) return;

    // Animate title
    gsap.fromTo(
      title,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
          id: "policies-title",
        },
      }
    );

    return () => {
      const trigger = ScrollTrigger.getById("policies-title");
      if (trigger) trigger.kill();
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <section
        ref={sectionRef}
        className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6"
      >
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-gray-900 tracking-tight"
            >
              Políticas y Términos
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl font-light max-w-2xl mx-auto">
              Información legal y políticas de nuestra empresa
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Última actualización: {new Date().toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Privacy Policy */}
            <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Política de Privacidad
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  En STGO Fine Art, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tus datos personales. Esta política describe cómo recopilamos, utilizamos y protegemos tu información.
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Información que Recopilamos
                  </h3>
                  <p className="mb-3">
                    Recopilamos información que nos proporcionas directamente cuando:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Realizas un pedido o solicitas nuestros servicios</li>
                    <li>Te registras en nuestra plataforma</li>
                    <li>Te pones en contacto con nosotros a través de formularios o correo electrónico</li>
                    <li>Suscribes a nuestro boletín informativo</li>
                  </ul>
                  <p className="mt-4">
                    Esta información puede incluir: nombre, dirección de correo electrónico, número de teléfono, dirección de envío, información de pago y cualquier otra información que elijas proporcionar.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Uso de la Información
                  </h3>
                  <p>
                    Utilizamos tu información personal para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                    <li>Procesar y completar tus pedidos</li>
                    <li>Comunicarnos contigo sobre tu pedido y nuestros servicios</li>
                    <li>Mejorar nuestros servicios y experiencia del usuario</li>
                    <li>Enviar información promocional (solo con tu consentimiento)</li>
                    <li>Cumplir con obligaciones legales</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Protección de Datos
                  </h3>
                  <p>
                    Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Compartir Información
                  </h3>
                  <p>
                    No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                    <li>Proveedores de servicios que nos ayudan a operar nuestro negocio (procesadores de pago, servicios de envío)</li>
                    <li>Cuando sea requerido por ley o para proteger nuestros derechos legales</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Tus Derechos
                  </h3>
                  <p>
                    Tienes derecho a acceder, rectificar, eliminar o limitar el procesamiento de tus datos personales. Para ejercer estos derechos, contáctanos a través de los medios indicados en nuestra página de contacto.
                  </p>
                </div>
              </div>
            </section>

            {/* Terms of Service */}
            <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Términos de Servicio
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Al acceder y utilizar nuestro sitio web y servicios, aceptas cumplir con estos términos de servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Uso del Sitio Web
                  </h3>
                  <p>
                    El contenido de este sitio web es propiedad de STGO Fine Art y está protegido por leyes de derechos de autor. No puedes reproducir, distribuir o utilizar nuestro contenido sin autorización previa por escrito.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Pedidos y Pagos
                  </h3>
                  <p>
                    Todos los pedidos están sujetos a disponibilidad y aceptación por parte de STGO Fine Art. Nos reservamos el derecho de rechazar cualquier pedido. Los precios están sujetos a cambios sin previo aviso, pero no afectarán pedidos ya confirmados.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Propiedad Intelectual
                  </h3>
                  <p>
                    Todas las imágenes, textos, logotipos y otros materiales en este sitio web son propiedad de STGO Fine Art o sus respectivos propietarios y están protegidos por leyes de propiedad intelectual.
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping Policy */}
            <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Política de Envío
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Proceso de Producción y Envío
                  </h3>
                  <p className="mb-4">
                    Una vez confirmado el pago y la orden, procedemos con la producción de tu pedido personalizado. El proceso es el siguiente:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 ml-4">
                    <li>
                      <strong>Confirmación de Pago:</strong> Una vez recibido el pago, tu pedido entra en producción.
                    </li>
                    <li>
                      <strong>Producción:</strong> El tiempo de producción es de <strong>5 días hábiles</strong> (lunes a viernes, excluyendo festivos). Durante este período, procesamos tu imagen, realizamos la impresión de calidad museo y, si corresponde, el enmarcado profesional.
                    </li>
                    <li>
                      <strong>Envío:</strong> Una vez completada la producción, el envío tarda entre <strong>1 a 3 días hábiles</strong> dependiendo de tu ubicación.
                    </li>
                  </ol>
                  <p className="mt-4">
                    En total, desde la confirmación del pago hasta la entrega, el tiempo estimado es de <strong>6 a 8 días hábiles</strong>.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Zonas de Envío
                  </h3>
                  <p>
                    Actualmente realizamos envíos dentro de Chile. Para envíos internacionales, contáctanos para consultar disponibilidad y costos adicionales.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Seguimiento de Pedidos
                  </h3>
                  <p>
                    Una vez que tu pedido sea enviado, recibirás un correo electrónico con el número de seguimiento para que puedas rastrear tu paquete.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Costos de Envío
                  </h3>
                  <p>
                    Los costos de envío se calculan según el tamaño del producto y la ubicación de destino. Se mostrarán antes de completar tu pedido.
                  </p>
                </div>
              </div>
            </section>

            {/* Return Policy */}
            <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Política de Devoluciones y Reembolsos
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Pedidos Personalizados
                  </h3>
                  <p className="mb-4">
                    <strong>Los pedidos personalizados (impresiones personalizadas y enmarcados a medida) no son elegibles para devolución ni reembolso.</strong> Esto se debe a que cada pedido es producido exclusivamente según tus especificaciones y no puede ser revendido.
                  </p>
                  <p>
                    Asegúrate de revisar cuidadosamente todos los detalles de tu pedido antes de confirmar el pago, incluyendo tamaño, tipo de medio, opciones de enmarcado y dirección de envío.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Productos de la Colección
                  </h3>
                  <p className="mb-4">
                    Para productos de nuestra colección estándar, aceptamos devoluciones bajo las siguientes condiciones:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>La solicitud de devolución debe realizarse dentro de <strong>14 días</strong> posteriores a la recepción del producto</li>
                    <li>El producto debe estar en su estado original, sin usar y en su embalaje original</li>
                    <li>Debe incluirse la factura o comprobante de compra</li>
                    <li>Los costos de envío de devolución corren por cuenta del cliente, a menos que el producto esté defectuoso o sea incorrecto</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Productos Defectuosos o Incorrectos
                  </h3>
                  <p>
                    Si recibes un producto defectuoso o que no corresponde a tu pedido, contáctanos inmediatamente. Reemplazaremos el producto o procesaremos un reembolso completo, incluyendo los costos de envío.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Proceso de Devolución
                  </h3>
                  <p>
                    Para iniciar una devolución elegible, contáctanos a través de nuestra página de contacto con tu número de pedido y el motivo de la devolución. Te proporcionaremos instrucciones detalladas sobre cómo proceder.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Reembolsos
                  </h3>
                  <p>
                    Una vez recibido y verificado el producto devuelto, procesaremos el reembolso a través del mismo método de pago utilizado en la compra original. El reembolso puede tardar entre 5 a 10 días hábiles en reflejarse en tu cuenta.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookie Policy */}
            <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Política de Cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web, analizar el tráfico y personalizar el contenido.
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    ¿Qué son las Cookies?
                  </h3>
                  <p>
                    Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Nos ayudan a recordar tus preferencias y mejorar la funcionalidad del sitio.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Tipos de Cookies que Utilizamos
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                    <li><strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio</li>
                    <li><strong>Cookies de funcionalidad:</strong> Recuerdan tus preferencias y configuraciones</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Control de Cookies
                  </h3>
                  <p>
                    Puedes controlar y eliminar cookies a través de la configuración de tu navegador. Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio web.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Protección de Datos y Cumplimiento Legal
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  STGO Fine Art cumple con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile y otras regulaciones aplicables de protección de datos.
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Base Legal para el Procesamiento
                  </h3>
                  <p>
                    Procesamos tus datos personales basándonos en:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                    <li>El consentimiento que nos proporcionas</li>
                    <li>La necesidad de cumplir con obligaciones contractuales</li>
                    <li>El cumplimiento de obligaciones legales</li>
                    <li>Nuestros intereses legítimos en operar y mejorar nuestro negocio</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Retención de Datos
                  </h3>
                  <p>
                    Conservamos tus datos personales solo durante el tiempo necesario para cumplir con los propósitos para los que fueron recopilados, o según lo requiera la ley.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    Transferencias Internacionales
                  </h3>
                  <p>
                    Si transferimos datos fuera de Chile, nos aseguramos de que existan salvaguardas adecuadas para proteger tu información personal.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact for Questions */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 sm:p-12 text-white shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                ¿Tienes Preguntas?
              </h2>
              <p className="text-gray-200 text-lg mb-6 font-light">
                Si tienes preguntas sobre estas políticas o sobre cómo manejamos tus datos, no dudes en contactarnos.
              </p>
              <a
                href="/contact"
                className="inline-block bg-white text-gray-900 py-4 px-8 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-xl"
              >
                Contáctanos
              </a>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

