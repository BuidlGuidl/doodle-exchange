const Loading = ({ text }: { text: string }) => {
  return (
    <dialog className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Loading...</h3>
        <p className="py-4">{text}</p>
      </div>
    </dialog>
  );
};

export default Loading;
