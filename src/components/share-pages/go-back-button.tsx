"use client";

export function GoBackButton({
  label = "Go back",
}: Readonly<{
  label?: string;
}>) {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    if (
      document.referrer &&
      document.referrer !==
        window.location.href
    ) {
      window.location.assign(
        document.referrer,
      );
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#6759df] px-5 text-sm font-bold text-white shadow-[0_16px_35px_-20px_rgba(74,60,190,0.8)]"
    >
      {label}
    </button>
  );
}
