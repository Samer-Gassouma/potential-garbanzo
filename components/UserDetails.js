export default function UserDetails({ user }) {
    return (
        <div className="w-1/3 p-4 bg-white border-l border-gray-300">
            <div className="flex items-center mb-4">
                <img
                    src={user.avatar || "/user.png"}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full"
                />
                <div className="ml-4">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-sm text-green-500 font-semibold">
                        {user.phone}</p>
                </div>
            </div>
            <div className="mb-4 flex items-center justify-center">
                <button className="bg-green-500 text-white px-2 py-2 rounded-md mr-2">
                    Add to leads
                </button>
                <button className="bg-green-500 text-white px-2 py-2 rounded-md">
                    Add to customers
                </button>
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <input
                    type="text"
                    placeholder="Add a tag"
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <textarea
                    placeholder="Add a note..."
                    className="w-full p-2 border rounded"
                    rows="4"
                ></textarea>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">History</h3>
                <ul className="text-sm text-gray-600">
                    <li>Chat created under channel "Other", with status "Active" 04/08, 11:10 AM</li>
                    {/* Add more history items here */}
                </ul>
            </div>
        </div>
    );
}
