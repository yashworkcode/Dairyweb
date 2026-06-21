const WhatsAppButton = () => {
  const number = "+91 9506236287";
  const message = encodeURIComponent("Hi! I'd like to know more about Vaishnavi Milk Dairy's delivery service.");

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-soft transition-transform hover:scale-110 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.001 3C9.382 3 4 8.382 4 15c0 2.39.673 4.62 1.84 6.52L4 29l7.69-1.8A11.94 11.94 0 0016 27c6.619 0 12-5.382 12-12S22.62 3 16.001 3zm0 21.6c-1.97 0-3.85-.55-5.47-1.59l-.39-.24-4.27 1 1.03-4.17-.26-.43A9.56 9.56 0 016.4 15c0-5.3 4.3-9.6 9.6-9.6 5.3 0 9.6 4.3 9.6 9.6 0 5.3-4.3 9.6-9.6 9.6zm5.27-7.19c-.29-.14-1.7-.84-1.96-.93-.26-.1-.46-.14-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.03-.5-.08-.14-.65-1.57-.9-2.14-.24-.55-.49-.48-.67-.49h-.57c-.19 0-.5.07-.77.36-.27.29-1.03 1-1.03 2.45 0 1.45 1.06 2.85 1.2 3.05.14.19 1.97 3.01 4.79 4.1 2.82 1.09 2.82.73 3.33.68.5-.05 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.27-.19-.56-.33z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
