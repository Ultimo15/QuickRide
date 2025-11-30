const captainModel = require("../models/captain.model");

// ✅ CREAR CAPITÁN CON NUEVOS CAMPOS
module.exports.createCaptain = async (
  firstname,
  lastname,
  email,
  password,
  phone,
  color,
  plateOrNumber, // ✅ Acepta "plate" o "number"
  capacity,
  type,
  brand = "No especificado",
  model = "No especificado"
) => {
  if (!firstname || !email || !password) {
    throw new Error("All fields are required");
  }

  const hashedPassword = await captainModel.hashPassword(password);

  const captain = await captainModel.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    password: hashedPassword,
    phone,
    vehicle: {
      color,
      plate: plateOrNumber, // ✅ Guardar como "plate"
      capacity,
      type,
      brand, // ✅ Nuevo campo
      model, // ✅ Nuevo campo
    },
  });

  return captain;
};