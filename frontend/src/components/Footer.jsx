import { MapPin, Clock, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="bg-[#2A2421] text-[#FDFBF7] pt-16 pb-24 sm:pb-16 mt-0"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E63946] flex items-center justify-center">
                <span className="font-display font-black text-white text-lg">
                  J
                </span>
              </div>
              <div className="leading-tight">
                <p className="font-display font-bold text-white text-base">
                  Pão de Queijo
                </p>
                <p className="font-display font-black text-[#FFB800] text-base -mt-0.5">
                  da Jossy
                </p>
              </div>
            </div>
            <p className="text-[#D8CFC7] text-sm leading-relaxed max-w-xs">
              O verdadeiro pão de queijo artesanal, feito com carinho e queijo
              de verdade. Do forno pra sua mesa, quentinho.
            </p>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-black tracking-[0.25em] uppercase text-[#FFB800] mb-4">
              Funcionamento
            </p>
            <div className="space-y-3 text-sm text-[#D8CFC7]">
              <div className="flex items-start gap-2">
                <Clock size={16} className="mt-0.5 flex-shrink-0 text-[#FFB800]" />
                <span>
                  Seg a Sáb · 08h às 18h
                  <br />
                  <span className="text-[#8A7F76]">
                    Encomendas com 24h de antecedência
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#FFB800]" />
                <span>
                  Atendemos sob encomenda
                  <br />
                  <span className="text-[#8A7F76]">
                    Retirada e entrega combinadas pelo WhatsApp
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-black tracking-[0.25em] uppercase text-[#FFB800] mb-4">
              Fale com a Jossy
            </p>
            <div className="flex flex-col gap-3">
              {/* Link WhatsApp com SVG */}
              <a
                data-testid="footer-whatsapp"
                href="https://wa.me/5579999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#25D366]">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.488 1.451 5.42 1.452 5.367 0 9.737-4.37 9.74-9.741.002-2.593-1.003-5.031-2.831-6.861-1.829-1.83-4.27-2.834-6.86-2.835-5.375 0-9.744 4.371-9.747 9.744-.001 2.02.529 3.993 1.536 5.74L1.9 22.074l4.747-1.247zM17.41 14.536c-.327-.164-1.933-.955-2.227-1.062-.294-.107-.509-.16-.723.164-.214.325-.83.106-1.018.326-.188.218-.376.107-.702-.057-.327-.164-1.38-.509-2.63-1.625-.972-.867-1.628-1.939-1.819-2.266-.192-.326-.02-.503.143-.665.147-.145.327-.38.49-.57.163-.19.218-.327.327-.545.108-.217.054-.407-.027-.57-.08-.163-.723-1.74-.991-2.383-.261-.627-.527-.541-.723-.551-.189-.01-.407-.01-.625-.01-.218 0-.571.082-.871.408-.3.326-1.144 1.114-1.144 2.717 0 1.603 1.166 3.151 1.329 3.37.162.217 2.296 3.507 5.562 4.915.777.335 1.384.535 1.856.685.781.248 1.492.213 2.054.129.627-.094 1.933-.79 2.204-1.55.272-.759.272-1.411.19-1.549-.082-.138-.294-.22-.622-.383z"/>
                </svg>
                (79) 99999-9999
              </a>

              {/* Link Instagram com SVG */}
              <a
                data-testid="footer-instagram"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFB800]">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                @paodequeijodajossy
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#8A7F76]">
            © {new Date().getFullYear()} Pão de Queijo da Jossy. Todos os
            direitos reservados.
          </p>
          <p className="text-xs text-[#8A7F76] inline-flex items-center gap-1.5">
            Feito com <Heart size={12} className="text-[#E63946] fill-[#E63946]" /> e muito queijo.
          </p>
        </div>
      </div>
    </footer>
  );
};