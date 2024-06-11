export default function ImagePreview(image: { image: string }) {
  return (
    ((image.image != "undefined") ? (<div className="z-10 md:w-[calc(100vw-400px)] w-full h-screen absolute backdrop-blur bg-black bg-opacity-50 overflow-hidden flex justify-center items-center">
      <img className="w-full h-full p-10 aspect-auto object-contain" src={String(image.image)} />
      <div className="absolute bottom-20 text-white bg-black bg-opacity-65 px-5 py-2 rounded-xl">Click anywhere to exit.</div>
    </div>) : null)
  )
}
