const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="w-12 h-12 bg-[#FFD700] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="text-[#FFD700]" size={24} />
      </div>
      <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
