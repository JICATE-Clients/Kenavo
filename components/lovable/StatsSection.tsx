import React from 'react';

interface StatCardProps {
  number: string;
  description: string;
  bgColor: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, description, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} flex flex-col items-center justify-center font-bold aspect-square w-full max-w-[160px] sm:max-w-[180px] md:max-w-[200px] mx-auto p-4 sm:p-5 md:p-6 rounded-full shadow-xl hover:scale-105 transition-transform`}>
      <div className={`${textColor} text-xl sm:text-2xl md:text-3xl leading-snug`}>
        {number}
      </div>
      <div className="text-white text-[10px] sm:text-xs md:text-sm leading-normal text-center mt-2 sm:mt-3">
        {description.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < description.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const StatsSection = () => {
  const stats = [
    {
      number: "72",
      description: "Nicknames still remembered",
      bgColor: "bg-[rgba(217,81,100,1)]",
      textColor: "text-[rgba(65,32,128,1)]"
    },
    {
      number: "70+",
      description: "At Alumni",
      bgColor: "bg-[rgba(137,58,190,1)]",
      textColor: "text-neutral-100"
    },
    {
      number: "150+",
      description: "Photos\nuploaded",
      bgColor: "bg-[rgba(217,81,100,1)]",
      textColor: "text-[rgba(65,32,128,1)]"
    },
    {
      number: "41",
      description: "Cities Represented",
      bgColor: "bg-[rgba(137,58,190,1)]",
      textColor: "text-neutral-100"
    }
  ];

  return (
    <section
      className="relative w-full bg-[rgba(78,46,140,1)] py-8 sm:py-10 md:py-12 lg:py-14 overflow-hidden"
      aria-labelledby="stats-heading"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://api.builder.io/api/v1/image/assets/b95740542f8a4181a070e70dfc13758e/3fd1f4a82581cd0af28b50a05b1f32a051095786?placeholderIfAbsent=true"
          alt="Stats section background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Soft corner glows — large radial ellipses centered on the corners so
          only a faint quarter peeks in; the rest is clipped by overflow-hidden.
          The gradient fades to the section's own purple, so it blends cleanly. */}
      <div
        aria-hidden
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none z-0 opacity-70"
        style={{ background: 'radial-gradient(50% 50% at 50% 50%, #A840D8 0%, rgba(78, 46, 140, 0) 100%)' }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none z-0 opacity-70"
        style={{ background: 'radial-gradient(50% 50% at 50% 50%, #A840D8 0%, rgba(78, 46, 140, 0) 100%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2
            id="stats-heading"
            className="text-[rgba(217,81,100,1)] font-bold leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.2' }}
          >
            Kenavo by the Numbers
          </h2>
          <p
            className="text-white font-normal mt-5"
            style={{ fontSize: 'clamp(16px, 2vw, 22px)', lineHeight: '1.5' }}
          >
            Some stats. Some smiles.
          </p>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-center">
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
