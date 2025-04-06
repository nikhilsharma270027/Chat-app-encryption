import User from "../Schemas/User.js";

const searchUser = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            {
              "name": { $regex: req.query.search, $options: "i"},
            },
            {
              "email": { $regex: req.query.search, $options: "i" }, 
            },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user } });

    return res.status(200).json(users);
  } catch (error) {
    console.log("Error searching users", error);
    return res.status(500).json({ message: "Internal Serber Error" });
  }
};

export default searchUser;
