import Footer from "@/layout/Footer";
import Header from "@/layout/Header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="public-grid">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
