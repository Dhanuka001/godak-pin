const Contact = () => (
  <div className="container-fixed py-10">
    <div className="card p-6 space-y-4">
      <h1 className="text-2xl font-semibold">සම්බන්ධ වෙනවා / Contact Us</h1>
      <p className="text-slate-600">
        Tell us your ideas, report an issue, or partner with us. We usually reply within 1–2 business days.
      </p>
      <div className="space-y-2 text-slate-700">
        <div className="flex items-center gap-2">
          <span aria-hidden>📞</span>
          <a className="text-primary hover:text-primary-dark font-semibold" href="tel:+94716610705">
            +94 71 661 0705
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden>✉️</span>
          <a className="text-primary hover:text-primary-dark font-semibold" href="mailto:hello@godakpin.lk">
            hello@godakpin.lk
          </a>
        </div>
      </div>
      <div className="text-sm text-slate-500">
        Safety reminder: arrange meetups in public places and confirm item condition before pickup.
      </div>
    </div>
  </div>
);

export default Contact;
