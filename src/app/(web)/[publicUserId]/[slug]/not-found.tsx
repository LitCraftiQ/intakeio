import {
  Link2Off,
} from "lucide-react";

import {
  GoBackButton,
} from "@/components/share-pages/go-back-button";

export default function SharePageNotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-gradient-to-br from-[#e9e7ff] via-[#edf3ff] to-[#ddf6f3] px-5 py-12 text-[#1d2742]">
      <section className="w-full max-w-md rounded-[30px] border border-white/75 bg-white/70 p-5 text-center shadow-[0_34px_110px_-45px_rgba(47,58,99,0.38)] backdrop-blur-2xl sm:p-8">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#eeecff] text-[#6b5ede]">
          <Link2Off
            className="h-7 w-7"
            aria-hidden="true"
          />
        </span>

        <h1 className="mt-5 text-2xl font-black tracking-[-0.045em]">
          This page is no longer available
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6d7890]">
          The owner may have removed this page or made it private.
        </p>

        <GoBackButton />
      </section>
    </main>
  );
}
