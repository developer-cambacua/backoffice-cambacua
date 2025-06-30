"use client";
import { signIn } from "next-auth/react";
import ImgIndex from "@/assets/img/icons/main/log-in/log-in.svg";
import { Container } from "@/components/container/Container";

export default function Home() {
  return (
    <Container className="container mx-auto h-full px-6">
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-12 md:col-span-6 lg:col-span-6 content-center">
          <div className="space-y-4">
            <h1 className="font-semibold text-2xl sm:text-4xl">Backoffice Cambacuá</h1>
            <p>Accede al sitio de gestiones de Cambacuá B&B</p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-3 box-shadow-1 mt-4 py-4 px-8 md:px-12 lg:px-20 bg-white text-lg rounded-lg border-2 border-transparent hover:border-gray-300 transition-colors"
            onClick={async () => {
              await signIn("google", {
                redirect: false,
                callbackUrl: "/reservas",
              });
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 326667 333333"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              imageRendering="optimizeQuality"
              fillRule="evenodd"
              clipRule="evenodd"
              className="size-6">
              <path
                d="M326667 170370c0-13704-1112-23704-3518-34074H166667v61851h91851c-1851 15371-11851 38519-34074 54074l-311 2071 49476 38329 3428 342c31481-29074 49630-71852 49630-122593m0 0z"
                fill="#4285f4"
              />
              <path
                d="M166667 333333c44999 0 82776-14815 110370-40370l-52593-40742c-14074 9815-32963 16667-57777 16667-44074 0-81481-29073-94816-69258l-1954 166-51447 39815-673 1870c27407 54444 83704 91852 148890 91852z"
                fill="#34a853"
              />
              <path
                d="M71851 199630c-3518-10370-5555-21482-5555-32963 0-11482 2036-22593 5370-32963l-93-2209-52091-40455-1704 811C6482 114444 1 139814 1 166666s6482 52221 17777 74814l54074-41851m0 0z"
                fill="#fbbc04"
              />
              <path
                d="M166667 64444c31296 0 52406 13519 64444 24816l47037-45926C249260 16482 211666 1 166667 1 101481 1 45185 37408 17777 91852l53889 41853c13520-40185 50927-69260 95001-69260m0 0z"
                fill="#ea4335"
              />
            </svg>
            Ingresá con tu cuenta
          </button>
        </div>
        <div className="hidden md:block col-span-12 md:col-span-6 lg:col-span-6 content-center justify-self-center">
          <img src={ImgIndex.src} alt="" />
        </div>
      </div>
    </Container>
  );
}
