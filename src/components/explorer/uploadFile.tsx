import { Blockquote, Box, Button, Card, Dialog, Flex, Progress, Spinner, Strong, Text } from "@radix-ui/themes";
import React, { useState } from "react";
import { getSetting } from "@/hooks/useLocalStore.ts";
import { FileOnStore } from "@/types/FileOnStore.ts";
import { createFile } from "@/hooks/useFileStore.ts";
import * as Toast from "@radix-ui/react-toast";
import axios from "axios";
import { motion } from "framer-motion";
import "@/styles/toast.css";

export default function UploadFile({ root, reFetchDir }) {
  const [file, setFile] = useState();
  const [step, setStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openToast, setOpenToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [message, setMessage] = useState("");

  const [isDialogOpen, setDialogOpen] = useState(false);

  const readfile = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsArrayBuffer(file);
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const setting = await getSetting();

    setUploadProgress(0);
    setIsWarning(setting.publisher === "https://publisher.walrus-testnet.walrus.space");
    setStep(2);

    try {
      const blob = await readfile(file);
      const plaintextbytes = new Uint8Array(blob);

      const pbkdf2iterations = 10000;
      const passphrasebytes = new TextEncoder().encode(setting.walrusHash);
      const pbkdf2salt = new TextEncoder().encode(setting.walrusSalt);

      const passphrasekey = await crypto.subtle.importKey("raw", passphrasebytes, "PBKDF2", false, ["deriveBits"]);
      let pbkdf2bytes = new Uint8Array(
        await crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: pbkdf2salt,
            iterations: pbkdf2iterations,
            hash: "SHA-256",
          },
          passphrasekey,
          384
        )
      );

      let keybytes = pbkdf2bytes.slice(0, 32);
      let ivbytes = pbkdf2bytes.slice(32);
      const key = await crypto.subtle.importKey("raw", keybytes, "AES-CBC", false, ["encrypt"]);
      let cipherbytes = new Uint8Array(
        await crypto.subtle.encrypt({ name: "AES-CBC", iv: ivbytes }, key, plaintextbytes)
      );

      const resultbytes = new Uint8Array(cipherbytes.length + 16);
      resultbytes.set(new TextEncoder().encode("Salted__"));
      resultbytes.set(pbkdf2salt, 8);
      resultbytes.set(cipherbytes, 16);

      const config = {
        headers: { "content-type": "application/octet-stream" },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        },
      };

      const publisherUrl = `${setting.publisher}/v1/blobs?deletable=true`;
      const response = await axios.put(publisherUrl, resultbytes, config);

      setUploadProgress(0);
      setStep(0);
      setDialogOpen(false);

      const blobId = response.data.alreadyCertified?.blobId || response.data.newlyCreated?.blobObject.blobId;
      if (!blobId) throw new Error("Missing blob ID in Walrus response");

      const fileInfo = {
        id: "",
        name: file.name,
        parentId: root.id,
        blobId,
        mediaType: file.type,
        icon: "",
        size: file.size,
        createAt: 0,
        password: setting.walrusHash,
        salt: setting.walrusSalt,
      };

      await createFile(fileInfo);
      reFetchDir();
      setMessage(response.data.alreadyCertified ? "File already exists" : "Uploaded successfully");
      setOpenToast(true);
    } catch (error) {
      setUploadProgress(0);
      setStep(0);
      setMessage("Upload failed. Please check your network or Walrus configuration.");
      setIsError(true);
    }
  };

  return (
    <>
      <Dialog.Root open={isDialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger>
          <Button onClick={() => setDialogOpen(true)}>Upload File</Button>
        </Dialog.Trigger>
        <Dialog.Content maxWidth="650px">
          <Dialog.Title style={{ color: "green" }}>Step 1: ENCRYPT file</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Text>Files are encrypted using AES-CBC 256-bit encryption before uploading.</Text>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit">ENCRYPT</Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={step === 2}>
        <Dialog.Content maxWidth="550px">
          <Dialog.Title style={{ color: "green" }}>Step 2: Upload encrypted file to Walrus</Dialog.Title>
          <Flex direction="column" gap="3">
            {isWarning && (
              <Card>
                <Text>Walrus publisher limits requests to <Strong>10 MB</Strong>. Run your own publisher for larger files.</Text>
              </Card>
            )}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.5 }}
            >
              <Progress value={uploadProgress} size="3" variant="soft" color="green" />
            </motion.div>
            {uploadProgress >= 100 && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Spinner loading />
              </motion.div>
            )}
            <Text>Waiting for Walrus response...</Text>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {isError && (
        <Dialog.Root open={isError} onOpenChange={setIsError}>
          <Dialog.Content maxWidth="450px">
            <Dialog.Title>Network Error</Dialog.Title>
            <Text>{message}</Text>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button onClick={() => setIsError(false)}>Close</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}

      <Toast.Provider swipeDirection="right">
        <Toast.Root className="ToastRoot" open={openToast} onOpenChange={setOpenToast}>
          <Toast.Title className="ToastTitle">{message}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="ToastViewport" />
      </Toast.Provider>
    </>
  );
}
