import React from 'react';

const WhatsAppLayout = () => {
  return (
    <div className="flex h-screen bg-blue-100 font-sans text-brown-800" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Left Sidebar */}
      <div className="w-1/3 max-w-sm border-r border-brown-300 flex flex-col" style={{ backgroundColor: '#f5e7d3', borderRadius: '8px 0 0 8px' }}>
        {/* Search Bar */}
        <div className="p-4" style={{ backgroundColor: '#e6d5c3' }}>
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full p-2 bg-beige-100 border border-brown-300 rounded focus:outline-none text-brown-800"
            style={{ backgroundColor: '#f5e7d3', borderRadius: '4px', borderWidth: '2px' }}
          />
        </div>
        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-2" style={{ backgroundColor: '#f5e7d3' }}>
          {/* Example Contact */}
          <div className="p-3 flex items-center hover:bg-beige-200 cursor-pointer rounded" style={{ backgroundColor: '#f5e7d3', borderRadius: '4px' }}>
            <div className="w-10 h-10 rounded-full bg-brown-200 border border-brown-300"></div>
            <div className="ml-4">
              <p className="font-semibold">John Doe</p>
              <p className="text-sm text-brown-500">Hey, are you coming?</p>
            </div>
          </div>
          {/* Another Contact */}
          <div className="p-3 flex items-center hover:bg-beige-200 cursor-pointer rounded" style={{ backgroundColor: '#f5e7d3', borderRadius: '4px' }}>
            <div className="w-10 h-10 rounded-full bg-brown-200 border border-brown-300"></div>
            <div className="ml-4">
              <p className="font-semibold">Jane Smith</p>
              <p className="text-sm text-brown-500">Let's catch up!</p>
            </div>
          </div>
          {/* Repeat contacts as needed */}
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="flex flex-col flex-1" style={{ backgroundColor: '#f5e7d3', borderRadius: '0 8px 8px 0' }}>
        {/* Chat Header */}
        <div className="p-4 border-b border-brown-300 flex items-center" style={{ backgroundColor: '#e6d5c3' }}>
          <div className="w-10 h-10 rounded-full bg-brown-200 border border-brown-300"></div>
          <div className="ml-4">
            <p className="font-semibold">John Doe</p>
            <p className="text-sm text-brown-500">Online</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#f5e7d3' }}>
          <div className="space-y-4">
            {/* Received Message */}
            <div className="flex items-end">
              <div className="bg-beige-200 p-2 rounded shadow-md max-w-xs" style={{ backgroundColor: '#f5e7d3', border: '2px solid #a2cffe', borderRadius: '8px' }}>
                <p>Hello, how are you?</p>
              </div>
            </div>
            {/* Sent Message */}
            <div className="flex items-end justify-end">
              <div className="bg-blue-200 p-2 rounded shadow-md max-w-xs" style={{ backgroundColor: '#a2cffe', border: '2px solid #f5e7d3', borderRadius: '8px' }}>
                <p>I'm good, thanks!</p>
              </div>
            </div>
            {/* More messages as needed */}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-brown-300" style={{ backgroundColor: '#e6d5c3' }}>
          <div className="flex">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 p-2 bg-beige-100 border border-brown-300 rounded-l focus:outline-none text-brown-800"
              style={{ backgroundColor: '#f5e7d3', borderRadius: '4px 0 0 4px', borderWidth: '2px' }}
            />
            <button className="p-2 bg-blue-300 text-brown-800 rounded-r hover:bg-blue-400 transition" style={{ backgroundColor: '#a2cffe', borderRadius: '0 4px 4px 0', border: '2px solid #f5e7d3' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLayout;