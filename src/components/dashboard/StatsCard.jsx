const StatsCard = ({

  title,

  value,

  icon,

  color,

}) => {

  return (

    <div
      className="
        bg-slate-800
        rounded-2xl
        p-6
        border
        border-slate-700
        hover:border-blue-500
        transition
      "
    >

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-400">

            {title}

          </p>

          <h2 className="text-4xl font-bold mt-3">

            {value}

          </h2>

        </div>

        <div
          className={`text-5xl ${color}`}
        >

          {icon}

        </div>

      </div>

    </div>

  );

};

export default StatsCard;