export const getcurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
