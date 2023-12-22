export default function capitalizeFirstLetter(str: string) {
  return typeof str === "string"
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : "";
}
