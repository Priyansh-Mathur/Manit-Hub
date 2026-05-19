export default function ManitMap() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <iframe
        title="MANIT Campus Map"
        src="https://www.google.com/maps/d/embed?mid=1D1OCIlq49qF4mNJKGKJ5YeAk_Deulpw"
        width="100%"
        height="500"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}