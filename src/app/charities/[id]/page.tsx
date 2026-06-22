import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CharityDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: charity } = await supabase.from("charities").select("*").eq("id", params.id).single();
  if (!charity) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        {charity.image_url && (
          <div className="relative h-64 w-full overflow-hidden rounded-2xl">
            <Image src={charity.image_url} alt={charity.name} fill className="object-cover" />
          </div>
        )}
        <h1 className="mt-8 font-display text-4xl font-medium">{charity.name}</h1>
        <p className="mt-4 text-ink/70">{charity.description}</p>
        {charity.website && (
          <a href={charity.website} target="_blank" className="mt-6 inline-block font-semibold text-coral underline">
            Visit their site →
          </a>
        )}
      </main>
      <Footer />
    </>
  );
}
