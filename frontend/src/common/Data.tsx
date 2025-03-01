const sampleRecentChats = [
    {
      id: "group1",
      name: "Developers Hub",
      isGroup: true,
      members: [
        { id: "user1", name: "Alice" },
        { id: "user2", name: "Bob" },
        { id: "user3", name: "Charlie" },
      ],
      messages: [
        { sender: "Alice", text: "Hey team! What’s the update?", timestamp: "10:00 AM" },
        { sender: "Bob", text: "Working on the UI fixes.", timestamp: "10:05 AM" },
        { sender: "Charlie", text: "API integration is done!", timestamp: "10:10 AM" },
      ],
      lastMessage: {
        sender: "Charlie",
        text: "API integration is done!",
        timestamp: "10:10 AM",
      },
    },
    {
      id: "group2",
      name: "Project X",
      isGroup: true,
      members: [
        { id: "user1", name: "Alice" },
        { id: "user4", name: "David" },
        { id: "user5", name: "Eve" },
      ],
      messages: [
        { sender: "Alice", text: "Did we finalize the deadline?", timestamp: "9:30 AM" },
        { sender: "David", text: "Yes, it's set for March 10.", timestamp: "9:35 AM" },
        { sender: "Eve", text: "Cool, I’ll update the doc.", timestamp: "9:40 AM" },
      ],
      lastMessage: {
        sender: "Eve",
        text: "Cool, I’ll update the doc.",
        timestamp: "9:40 AM",
      },
    },
  ];
  
  export default sampleRecentChats;
  