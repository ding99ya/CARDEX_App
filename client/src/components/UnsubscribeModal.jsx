import React from "react";

const UnsubscribeModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-[calc(100%-1rem)] sm:max-w-md bg-white shadow-xl rounded-3xl"
      >
        <div className="w-full">
          <div className="flex flex-col justify-center text-center px-4 lg:px-8 py-4">
            {/* <div className="text-left text-xl font-bold mb-2">
              Insufficient Points
            </div> */}

            <div className="flex flex-col items-start space-y-2 mt-2">
              <p>You have successfully unsubscribed to notifications</p>
            </div>

            <div className="flex flex-col items-center space-y-2 mt-4 w-full max-w-xs mx-auto">
              <div className="w-full flex justify-center mt-2">
                <button
                  className="w-full px-4 py-1 mb-2 rounded-full flex items-center justify-center bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
                  onClick={onClose}
                >
                  <span className="text-sm">Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeModal;
