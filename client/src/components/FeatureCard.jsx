const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-50 group hover:-translate-y-2">
      <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        <Icon className="text-[#FFD700]" size={32} />
      </div>
      <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
