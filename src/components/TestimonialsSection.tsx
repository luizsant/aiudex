import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Dr. Ana Paula Santos",
    role: "Advogada Civilista",
    firm: "Santos & Associados",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content:
      "O AIudex revolucionou minha prática. Gero peças processuais em minutos, com qualidade excepcional. Aumentei minha produtividade em 300%.",
    rating: 5,
  },
  {
    id: 2,
    name: "Dr. Carlos Eduardo Lima",
    role: "Advogado Trabalhista",
    firm: "Lima Advocacia",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content:
      "A IA jurídica é impressionante. Sugere argumentos que nem sempre penso, baseados na jurisprudência mais recente. Indispensável para qualquer advogado.",
    rating: 5,
  },
  {
    id: 3,
    name: "Dra. Maria Fernanda Costa",
    role: "Sócia Fundadora",
    firm: "Costa & Partners",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    content:
      "O CRM jurídico integrado é fantástico. Consigo gerenciar todos os processos, prazos e clientes em um só lugar. Organização total!",
    rating: 5,
  },
  {
    id: 4,
    name: "Dr. Ricardo Mendes",
    role: "Advogado Empresarial",
    firm: "Mendes Law Firm",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content:
      "O assistente IA é como ter um estagiário que conhece toda a legislação. Responde dúvidas complexas instantaneamente. Economia de tempo incrível.",
    rating: 5,
  },
];

// Permitir passar depoimentos por props, mas manter fallback para o array antigo
const TestimonialsSection = ({
  testimonials: testimonialsProp,
}: {
  testimonials?: any[];
}) => {
  const testimonialsToShow = testimonialsProp || testimonials;
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            O que dizem nossos <span className="text-blue-600">advogados</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Mais de 2.000 profissionais jurídicos confiam no AIudex para
            otimizar sua prática diária
          </p>
        </div>

        <Carousel className="max-w-5xl mx-auto">
          <CarouselContent>
            {testimonialsToShow.map((testimonial, idx) => (
              <CarouselItem
                key={testimonial.id || idx}
                className="md:basis-1/2 lg:basis-1/2">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <Quote className="w-8 h-8 text-blue-600 mr-4" />
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-amber-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-700 text-lg leading-relaxed mb-6">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center">
                      {testimonial.image && (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {testimonial.name}
                        </h4>
                        <p className="text-blue-600 font-medium">
                          {testimonial.role}
                        </p>
                        {testimonial.firm && (
                          <p className="text-slate-500 text-sm">
                            {testimonial.firm}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsSection;
