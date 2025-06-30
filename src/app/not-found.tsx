import { WebErrors } from "@/components/webErrors/WebErrors";
import Footer from "@/layout/Footer";
import Header from "@/layout/Header";

export default function Page() {
  return (
    <div className="public-grid">
      <Header />
      <WebErrors code={404} />
      <Footer />
    </div>
  );
}
