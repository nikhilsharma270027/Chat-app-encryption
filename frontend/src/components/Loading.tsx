import { Spinner } from "@chakra-ui/react";

function Loading() {
  return (
    <div className="flex justify-center pt-44 2xl:pt-60 items-center">
      <Spinner textDecorationThickness="5px"  color="rgb(53,55,59)" size="xl" />
    </div>
  );
}

export default Loading;