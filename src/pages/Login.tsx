import dynamic from "next/dynamic";

const Login = dynamic(() => import("./LoginComponent"), {
  ssr: false,
  loading: () => <div>Carregando...</div>,
});

export default Login;
