import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    args[key] = next && !next.startsWith("--") ? next : "true";
    if (args[key] === next) i += 1;
  }

  return args;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const email = args.email?.trim();
const password = args.password?.trim();
const nombre = args.name?.trim() || "Administrador";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!email) fail("Falta --email");
if (!password) fail("Falta --password");
if (!supabaseUrl) fail("Falta NEXT_PUBLIC_SUPABASE_URL en el entorno.");
if (!serviceRoleKey) fail("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(targetEmail) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) throw error;

    const user = data.users.find((item) => item.email?.toLowerCase() === targetEmail.toLowerCase());
    if (user) return user;

    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function ensureAdminUser() {
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre },
    });

    if (error) throw error;
    user = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        nombre,
      },
    });

    if (error) throw error;
  }

  const { error: profileError } = await supabase
    .from("perfil")
    .update({
      nombre,
      rol: "ADMIN",
      activo: true,
    })
    .eq("id", user.id);

  if (profileError) throw profileError;

  console.log(`Usuario administrador listo: ${email}`);
}

ensureAdminUser().catch((error) => {
  fail(error.message ?? "No se pudo crear el usuario administrador.");
});
