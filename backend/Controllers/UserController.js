import User from "../Schemas/User.js";

const searchUser = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            {
              "personal_info.fullname": { $regex: req.query.search, $option: "i"},
            },
            {
              "personal_info.email": { $regex: req.query.search, $option: "i" },
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
