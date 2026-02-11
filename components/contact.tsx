"use client";

import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    from_name: "",
    reply_to: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(
        "https://t0gf755wm0.execute-api.us-east-1.amazonaws.com/default/sendEmailFromPortfolio",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );
      if (res.ok) {
        setStatus("sent");
        setFormData({ from_name: "", reply_to: "", message: "" });
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-center gap-4">
          <h2 className="text-sm font-mono tracking-widest text-accent uppercase">
            Contact
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mx-auto max-w-md">
          <p className="mb-8 text-center text-muted">
            {"Have a project in mind or just want to say hello? I'd love to hear from you."}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="from_name"
              type="text"
              placeholder="Name"
              value={formData.from_name}
              onChange={handleChange}
              required
              className="border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
            />
            <input
              name="reply_to"
              type="email"
              placeholder="Email"
              value={formData.reply_to}
              onChange={handleChange}
              required
              className="border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
            />
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="resize-none border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="border border-border px-6 py-3 text-sm text-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {status === "sending"
                ? "Sending..."
                : status === "sent"
                  ? "Sent!"
                  : "Send Message"}
            </button>
            {status === "error" && (
              <p className="text-center text-sm text-red-400">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
