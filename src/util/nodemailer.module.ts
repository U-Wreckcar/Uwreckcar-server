import transporter from '../config/nodemailer.config';

export async function verifyAccountToEmail (email: string, verificationCode: string) {
  const mailOptions = {
    from : `${process.env.NODEMAILER_ACCOUNT}@naver.com`,
    to : email,
    subject : 'U렉카 회원가입 인증 안내 입니다.',
    html : `
            <!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>U렉카 서비스를 이용해주셔서 감사합니다!</title>
    <style>
        /* CSS reset */
        body, h1, h2, h3, h4, h5, h6, p, ol, ul {
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f1f1f1;
        }

        h1, h2, h3, h4, h5, h6 {
            font-weight: normal;
            margin-bottom: 0.5rem;
            color: #222;
        }

        p {
            margin-bottom: 1rem;
            color: #444;
            font-size: 18px;
            line-height: 1.4;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .image-container {
            text-align: center;
            margin-bottom: 1rem;
        }

        .image-container img {
            max-width: 100%;
            height: auto;
        }

        .button {
            display: inline-block;
            background-color: #0070c0;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 1rem;
        }

        .button:hover {
            background-color: #005499;
        }

        .footer {
            margin-top: 2rem;
            text-align: center;
            color: #888;
        }

        .footer a {
            color: #888;
        }

        .footer a:hover {
            color: #444;
        }
    </style>
</head>

<body>
<div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
    <div class="image-container" style="text-align: center; margin-bottom: 1rem;">
        <img src="https://velog.velcdn.com/images/tastekim_/post/035ebb31-ff86-495e-a7a6-65ba041e9318/image.jpg" alt="Service Image" style="max-width: 100%; height: auto;">
    </div>
    <h1 style="font-weight: normal; margin-bottom: 0.5rem; color: #222;">유렉카 서비스를 이용해주셔서 감사합니다!</h1>
    <p style="margin-bottom: 1rem; color: #444; font-size: 18px; line-height: 1.4;">${email.split('@')[0]} 님,</p>
    <p style="margin-bottom: 1rem; color: #444; font-size: 18px; line-height: 1.4;">아래 인증 코드를 가지고 이메일 인증을 완료해주세요.</p>
    <p style="margin-bottom: 1rem; color: #444; font-size: 18px; line-height: 1.4;">* 한 번 사용된 메일은 재사용 할 수 없습니다. 인증을 받으신 후 메일을 삭제해주세요.</p>
    <p style="margin-bottom: 1rem; color: #444; font-size: 18px; line-height: 1.4;">인증 코드 : ${verificationCode}</p>
    <a href="https://utm.works" class="button" style="display: inline-block; background-color: #0070c0; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 1rem;">Explore our website</a>
    <p class="footer" style="margin-top: 2rem; text-align: center; color: #888;">Best regards,<br>Team 유렉카<br> © 2023 유렉카 All rights reserved.</p>
</div>
</body>
</html>
`,
  };

  transporter.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(err);
      throw new Error(err.message);
    }
  });
}