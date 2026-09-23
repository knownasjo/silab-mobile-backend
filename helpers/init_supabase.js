const { createClient } = require("@supabase/supabase-js");
const { sendPushNotification } = require("../helpers/init_firebase_admin");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function initSupabaseStorage() {
  try {
    const { data: bucketData, error: bucketError } =
      await supabase.storage.getBucket(process.env.IMAGES_BUCKET_NAME);

    if (bucketError) {
      console.error("Error fetching bucket:", bucketError);
    }

    if (!bucketData) {
      const { data: createData, error: createError } =
        await supabase.storage.createBucket("posters", {
          public: true,
          allowedMimeTypes: ["image/*"],
        });

      if (createError) {
        console.error("Error creating bucket:", createError);
      }
    } else {
      console.log(`Bucket ${bucketData.name} is Exist`);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

async function uploadPosterImage(file, announcementID) {
  const filePath = `posters/${announcementID}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(process.env.IMAGES_BUCKET_NAME)
    .upload(filePath, file.buffer, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.mimetype,
    });

  if (uploadError) {
    console.error("Upload Error:", uploadError.message);
    return null;
  }

  const { data: urlData, error: urlError } = supabase.storage
    .from(process.env.IMAGES_BUCKET_NAME)
    .getPublicUrl(filePath);

  if (urlError) {
    console.error("Error fetching public URL:", urlError.message);
    return null;
  }

  return urlData.publicUrl;
}

async function deletePosterImage(announcementID) {
  const filePath = `posters/${announcementID}`;

  const { data, error } = await supabase.storage
    .from(process.env.IMAGES_BUCKET_NAME)
    .remove([filePath]);

  if (error) console.log("Image Deletion Error :", error);
  console.log(data);
}

async function handlePaymentStatusChange(nim) {
  const { data: users, error } = await supabase
    .from("users")
    .select("fcm_token")
    .eq("nim", nim)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return;
  }

  if (users && users.fcm_token) {
    const message = {
      notification: {
        title: "Status Pembayaran Telah Diperbarui!",
        body: "Status pembayaran anda telah diperbarui. Silakan lanjutkan proses pemilihan kelas praktikum!",
      },
      token: users.fcm_token,
      data: {
        route: "/home/pilih-kelas",
        nim: nim,
      },
    };
    await sendPushNotification(message);
  }
}

initSupabaseStorage();

module.exports = {
  uploadPosterImage,
  deletePosterImage,
  supabase,
  handlePaymentStatusChange,
};
