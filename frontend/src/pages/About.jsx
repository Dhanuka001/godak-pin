const About = () => (
  <div className="container-fixed py-10">
    <div className="card p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">අප ගැන / About GodakPin.lk</h1>
        <p className="text-slate-600 mt-1">
          GodakPin.lk is a Sri Lankan giving platform. We help you pass on good-condition items you no longer use to
          someone who needs them—no selling, just kindness.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">How we work</h2>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>Post items quickly with photos, district, and city.</li>
          <li>Connect directly with donors/receivers to arrange pickup or delivery.</li>
          <li>Mark status as Available, Reserved, or Given to keep the community updated.</li>
          <li>Meet in safe public places and double-check items before handing over.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Our promise</h2>
        <p className="text-slate-600">
          Simple, trustworthy, and community-first. We keep data light, respect your time, and focus on people helping
          people.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Who is behind this?</h2>
        <p className="text-slate-600">
          A small Sri Lankan team building a safer, more generous internet experience for local communities. Your
          feedback shapes what we build next.
        </p>
      </div>
    </div>
  </div>
);

export default About;
