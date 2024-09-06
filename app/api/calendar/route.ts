import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
    },
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const bucketName = process.env.AWS_S3_BUCKET;
        if (!bucketName) {
            throw new Error("AWS_S3_BUCKET is not defined");
        }

        const key = `${Date.now()}-${file.name}`; // 유니크한 키 생성

        await s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            })
        );

        return NextResponse.json({ message: "File uploaded successfully", key }, { status: 200 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const key = req.nextUrl.searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: "No key provided" }, { status: 400 });
    }

    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
        throw new Error("AWS_S3_BUCKET is not defined");
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL은 1시간 동안 유효

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error("Error getting file URL:", error);
        return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 });
    }
}