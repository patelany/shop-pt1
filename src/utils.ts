// function to catch errors with mongoDB
export const errorResponse = (error: any, res: any): void => {
  console.log("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};
