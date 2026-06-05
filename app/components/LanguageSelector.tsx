export default function LanguageSelector({
  setLang,
}: {
  setLang: (e: string) => void;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-6 border">
      <label className="mb-2 block text-sm font-medium">Translate To</label>

      <select
        className="w-full rounded-xl border p-3"
        onChange={(e) => setLang(e.target.value)}
      >
        <option value={"French"}>French</option>
        <option value={"Dutch"}>Dutch</option>
        <option value={"German"}>German</option>
      </select>
    </div>
  );
}
