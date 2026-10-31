import BugCard from "../cards/BugCard";

const KanbanColumn = ({
  title,
  bugs,
  deleteBug,
  editBug,
  changeStatus,
}) => {
  return (
    <div className="bg-slate-800 p-5 rounded-2xl min-h-[500px]">

      {/* Title */}
      <h2 className="text-2xl font-bold mb-6">
        {title}
      </h2>

      {/* Bug List */}
      <div className="flex flex-col gap-4">

        {bugs.length > 0 ? (

          bugs.map((bug) => (

            <BugCard
              key={bug.id}
              id={bug.id}
              title={bug.title}
              priority={bug.priority}
              status={bug.status}
              changeStatus={changeStatus}
            />

          ))

        ) : (

          <div className="text-gray-400 text-center mt-10">

            No Bugs

          </div>

        )}

      </div>

    </div>
  );
};

export default KanbanColumn;