"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission with backend
    console.log("Form submitted:", formData);
    alert("¡Gracias por tu mensaje! Te responderemos pronto.");
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-gray-900 tracking-tight">
              Contáctanos
            </h1>
            <p className="text-gray-600 text-lg font-light">
              Estamos aquí para ayudarte con cualquier consulta
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-300 hover:border-gray-400 bg-white shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-300 hover:border-gray-400 bg-white shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none resize-none transition-all duration-300 hover:border-gray-400 bg-white shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 px-8 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg tracking-wide mt-8"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

