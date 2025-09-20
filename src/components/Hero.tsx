import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-black-900 via-black-800 to-brown-800 py-32 px-4 overflow-hidden">
      {/* Cafe Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Floating Logo Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-brown-600 to-brown-800 rounded-3xl flex items-center justify-center shadow-large animate-float">
        <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-2xl" />
      </div>
      <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-brown-600 to-brown-800 rounded-2xl flex items-center justify-center shadow-large animate-float" style={{animationDelay: '1s'}}>
        <img src="/logo.jpg" alt="Logo" className="w-16 h-16 rounded-xl" />
      </div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-brown-600 to-brown-800 rounded-xl flex items-center justify-center shadow-large animate-float" style={{animationDelay: '2s'}}>
        <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-lg" />
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-brown-600 to-brown-800 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-scale-in shadow-large">
            <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-3xl" />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-noto font-bold text-white mb-8 animate-fade-in tracking-tight">
          Cresencio Printing
          <span className="block text-brown-300 mt-4 text-2xl md:text-3xl font-light tracking-widest">PRINTING • QUALITY • SERVICE</span>
        </h1>
        
        <p className="text-xl text-brown-200 mb-12 max-w-4xl mx-auto animate-slide-up leading-relaxed font-light">
          Where every print job meets excellence and every order is handled with precision. 
          Professional printing services, quality materials, and reliable delivery in the heart of the community.
        </p>
        
        <div className="flex justify-center animate-slide-up">
          <button 
            onClick={() => {
              const element = document.getElementById('coffee');
              if (element) {
                const headerHeight = 80;
                const offset = headerHeight + 20;
                const elementPosition = element.offsetTop - offset;
                window.scrollTo({
                  top: elementPosition,
                  behavior: 'smooth'
                });
              }
            }}
            className="group bg-gradient-to-r from-black-800 to-black-900 text-white px-12 py-6 rounded-2xl hover:from-black-700 hover:to-black-800 transition-all duration-300 transform hover:scale-105 font-bold text-xl shadow-large hover:shadow-glow relative overflow-hidden border border-brown-600/30"
          >
            <span className="relative z-10 tracking-wider">VIEW SERVICES</span>
            <div className="absolute inset-0 bg-gradient-to-r from-brown-500/20 to-brown-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;