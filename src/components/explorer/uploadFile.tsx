import {Blockquote, Box, Button, Card, Dialog, Flex, Progress, Spinner, Strong, Text} from "@radix-ui/themes";
import {Form} from "react-router-dom";
import React, {useState} from "react";
import {getSetting} from "@/hooks/useLocalStore.ts";
import {BlobOnWalrus, NewBlobOnWalrus} from "@/types/BlobOnWalrus.ts";
import {FileOnStore} from "@/types/FileOnStore.ts";
import {createFile} from "@/hooks/useFileStore.ts";
import * as Toast from '@radix-ui/react-toast';
import axios from 'axios';

import "@/styles/toast.css";

export default function UploadFile(
    {
        root,
        reFetchDir,
    }) {
    const [file, setFile] = useState();
    const [step, setStep] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openToast, setOpenToast] = React.useState(false);
    const [isError, setIsError] = React.useState(false);
    const [isWarning, setIsWarning] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const readfile = (file) => {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result)
            };
            fr.readAsArrayBuffer(file);
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const setting = await getSetting();

        setUploadProgress(0);
        setIsWarning(setting.publisher === "https://publisher.walrus-testnet.walrus.space");
        setStep(2);

        const blob = await readfile(file).catch(function (err) {
            console.error(err);
        });
        // return

        const plaintextbytes = new Uint8Array(blob);

        const pbkdf2iterations = 10000;
        const passphrasebytes = new TextEncoder("utf-8").encode(setting.walrusHash);
        const pbkdf2salt = new TextEncoder("utf-8").encode(setting.walrusSalt);

        const passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits'])
            .catch(function (err) {
                console.error(err);
            });

        let pbkdf2bytes = await window.crypto.subtle.deriveBits({
            "name": 'PBKDF2',
            "salt": pbkdf2salt,
            "iterations": pbkdf2iterations,
            "hash": 'SHA-256'
        }, passphrasekey as CryptoKey, 384)
            .catch(function (err) {
                console.error(err);
            });
        pbkdf2bytes = new Uint8Array(pbkdf2bytes);

        let keybytes = pbkdf2bytes.slice(0, 32);
        let ivbytes = pbkdf2bytes.slice(32);

        const key = await window.crypto.subtle.importKey('raw', keybytes, {
            name: 'AES-CBC',
            length: 256
        }, false, ['encrypt'])
            .catch(function (err) {
                console.error(err);
            });

        var cipherbytes = await window.crypto.subtle.encrypt({
            name: "AES-CBC",
            iv: ivbytes
        }, key as CryptoKey, plaintextbytes)
            .catch(function (err) {
                console.error(err);
            });

        cipherbytes = new Uint8Array(cipherbytes);

        const resultbytes = new Uint8Array(cipherbytes.length + 16);
        resultbytes.set(new TextEncoder("utf-8").encode('Salted__'));
        resultbytes.set(pbkdf2salt, 8);
        resultbytes.set(cipherbytes, 16);

        const publisherUrl = `${setting.publisher}/v1/blobs?epochs=1`;
        const config = {
            headers: {
                'content-type': 'application/octet-stream',
            },
            onUploadProgress: function (progressEvent) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        };

        // axios.put(publisherUrl, plaintextbytes, config).then(response => {
        axios.put(publisherUrl, resultbytes, config).then(response => {
            console.log('store', response)
            setUploadProgress(0);
            let blobId: string;

            if (response.data.alreadyCertified) {
                blobId = (response.data.alreadyCertified as BlobOnWalrus).blobId
                setMessage("This file has already been uploaded")
            } else if (response.data.newlyCreated) {
                blobId = (response.data.newlyCreated as NewBlobOnWalrus).blobObject.blobId
                setMessage("Walrus file created successfully")
            } else {
                setUploadProgress(0);
                setStep(0);
                setMessage("Walrus's response is error.");
                setIsError(true);
                return;
            }

            const fileInfo: FileOnStore = {
                id: "",
                name: file.name,
                parentId: root.id,
                blobId: blobId,
                mediaType: file.type,
                icon: "",
                size: file.size,
                createAt: 0,
                password: setting.walrusHash,
                salt: setting.walrusSalt,
            }

            // console.log('new file', fileInfo);
            createFile(fileInfo).then(() => {
                reFetchDir()
                setStep(0);
                setOpenToast(true)
            })
        }).catch(error => {
            console.log('store error', error)
            setUploadProgress(0);
            setStep(0);
            setMessage('Please check your network configuration and make sure the Walrus service address is correct.');
            setIsError(true)
        })

    }

    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button onClick={
                        async () => {
                        }
                    }>Upload File</Button>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="650px">
                    <Dialog.Title>Step 1: ENCRYPT file</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>

                    <Form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="3">
                            <Text>
                                Walrus Disk uses javascript running within your web browser to encrypt and decrypt
                                files client-side, in-browser. This App makes no network connections during
                                this
                                process, to ensure that your keys never leave the web browser during
                                the
                                process.
                            </Text>
                            <Text>
                                All client-side cryptography is implemented using the Web Crypto API. Files
                                are encrypted using AES-CBC 256-bit symmetric encryption. The encryption key is
                                derived from the password and a random salt using PBKDF2 derivation with 10000
                                iterations of SHA256 hashing.

                            </Text>
                            <input type="file" onChange={(e) => {
                                setFile(e.target.files[0])
                            }}/>
                        </Flex>

                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Dialog.Close>
                                <Button type="submit">ENCRYPT</Button>
                            </Dialog.Close>
                        </Flex>
                    </Form>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={step == 2}>
                <Dialog.Content maxWidth="550px">
                    <Dialog.Title>Step 2: Upload encrypted files to Walrus Disk</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        {isWarning ?
                            <Card>
                                <Flex direction="column" gap="3">
                                    <Text>
                                        The Walrus system provides an interface that can be used for public testing. For
                                        your
                                        convenience, walrus provide these at the following hosts:
                                    </Text>
                                    <Text>
                                        <Text weight="bold">Aggregator:</Text> https://aggregator-devnet.walrus.space
                                    </Text>
                                    <Text>
                                        <Text weight="bold">Publisher:</Text> https://publisher-devnet.walrus.space
                                    </Text>
                                    <Text color="red">
                                        Walrus publisher is currently limiting requests to <Strong>10 MiB</Strong>. If
                                        you want
                                        to upload larger
                                        files, you need to run your own publisher.
                                    </Text>
                                </Flex>
                            </Card> : null}
                        {uploadProgress < 100 ?
                            <Progress value={uploadProgress} size="3"></Progress> :
                            <Button>
                                <Spinner loading></Spinner> Waiting Walrus response.
                            </Button>}
                    </Flex>

                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={isError}>
                <Dialog.Content maxWidth="450px">
                    <Dialog.Title>Network Error</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <Text>
                            {message}
                        </Text>

                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button onClick={() => {
                                    setIsError(false)
                                }}>Close</Button>
                            </Dialog.Close>
                        </Flex>

                    </Flex>

                </Dialog.Content>
            </Dialog.Root>

            <Toast.Provider swipeDirection="right">
                <Toast.Root className="ToastRoot" open={openToast} onOpenChange={setOpenToast}>
                    <Toast.Title className="ToastTitle">{message}</Toast.Title>
                </Toast.Root>
                <Toast.Viewport className="ToastViewport"/>
            </Toast.Provider>

        </>
    )
}
