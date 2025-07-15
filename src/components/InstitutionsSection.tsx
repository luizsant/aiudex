"use client";

import { useEffect, useState } from "react";

const institutions = [
  {
    name: "OAB Federal",
    logo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=80&fit=crop&crop=center",
  },
  {
    name: "OAB São Paulo",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=80&fit=crop&crop=center",
  },
  {
    name: "OAB Rio de Janeiro",
    logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=80&fit=crop&crop=center",
  },
  {
    name: "Machado Meyer",
    logo: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&h=80&fit=crop&crop=center",
  },
  {
    name: "Pinheiro Neto",
    logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=80&fit=crop&crop=center",
  },
  {
    name: "Mattos Filho",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=80&fit=crop&crop=center",
  },
  {
    name: "Lefosse",
    logo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=80&fit=crop&crop=center",
  },
  {
    name: "TozziniFreire",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=80&fit=crop&crop=center",
  },
];

const InstitutionsSection = () => {
  const [duplicatedInstitutions, setDuplicatedInstitutions] =
    useState(institutions);

  useEffect(() => {
    setDuplicatedInstitutions([...institutions, ...institutions]);
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Confiança de grandes instituições
          </h3>
          <p className="text-slate-600 dark:text-gray-300">
            Utilizado por escritórios renomados e instituições jurídicas em todo
            o Brasil
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-infinite">
            {duplicatedInstitutions.map((institution, index) => (
              <div
                key={`${institution.name}-${index}`}
                className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <img
                  src={institution.logo}
                  alt={institution.name}
                  className="h-16 w-auto object-contain rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstitutionsSection;
