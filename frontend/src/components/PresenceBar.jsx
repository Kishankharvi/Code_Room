export default function PresenceBar({ participants }) {
  console.log(participants)
  console.log("Rendering PresenceBar with participants:", participants);
  console.log("Number of participants:", participants.length);
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        Online ({participants.length})
      </h3>

      <ul className="space-y-2">
        {participants.map((p) => (
          <li
            key={p.username}
            className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-xl"
          >
            <span>{p.username}</span>
            <span
              className={`px-2 py-0.5 rounded-xl text-xs ${
                p.role === "mentor"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {p.role}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
