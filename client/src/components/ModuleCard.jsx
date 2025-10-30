const ModuleCard = ({ title, description, icon, onClick, count }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        {count !== undefined && (
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default ModuleCard;
