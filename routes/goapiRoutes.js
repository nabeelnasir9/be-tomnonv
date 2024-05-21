const express = require("express");
const axios = require("axios");
const router = express.Router();
const Prompt = require("../models/prompts");
const token = process.env.X_API_KEY || null;

async function CheckProgress(reqid) {
  return new Promise((resolve, reject) => {
    const url = "https://api.midjourneyapi.xyz/mj/v2/fetch";
    const interval = setInterval(async () => {
      try {
        const rq = await axios.post(url, { task_id: reqid });
        if (rq.data.status === "finished") {
          clearInterval(interval);
          resolve(rq.data);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  });
}

async function checkProgressSwap(reqid) {
  return new Promise((resolve, reject) => {
    const url = "https://api.goapi.xyz/api/face_swap/v1/fetch";
    const interval = setInterval(async () => {
      try {
        const rq = await axios.post(url, { task_id: reqid });
        if (rq.data.data.status === "success") {
          clearInterval(interval);
          resolve(rq.data);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  });
}

router.get("/get-prompts", async (req, res) => {
  try {
    const prompts = await Prompt.find();
    if (!prompts || prompts.length === 0) {
      throw new Error("No prompts found in database");
    }
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prompts" });
    console.error(error);
  }
});
// const replacePlaceholders = (text) => {
//   const genderPattern = /\b(man|woman|male|female|boy|girl)\b/gi;
//   const ethnicityPattern =
//     /\b(Asian|Japanese|Black|White|Hispanic|Latino|Native American|Pacific Islander)\b/gi;
//
//   return text
//     .replace(genderPattern, "{gender}")
//     .replace(ethnicityPattern, "{ethnicity}");
// };

// router.get("/add", async (req, res) => {
//   const promptsData = [
//     {
//       img: "https://s.mj.run/tU1Gdi6ljsI",
//       prompt:
//         "Subject is a young japanese man on island carrying a bag on a stick and skipping carelessly. subject is facing the camera. fullshot. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/XYXp3pLcgMI",
//       prompt:
//         "young japanese man. magician. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/aTiBeUVKaDM",
//       prompt:
//         "young japanese man. fullshot. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/8ZtGEg6NAxQ",
//       prompt:
//         "young japanese man sitting on a throne. the man has a feminine quality. the man is wearing white. 45 degree sideview. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/WSU4kkdLKR0",
//       prompt:
//         "young japanese man sitting on a throne. fullshot. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/1Kh8oqKnA9o",
//       prompt:
//         "young japanese religious leader and two followers at his feet. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/znaawmKfib8",
//       prompt:
//         "two lovers of the same {gender} gender. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/xIEpha1G8ag",
//       prompt:
//         "a young japanese man riding in a chariot, adorned by armor and a crown, two sphinxes, a canopy full of stars. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/px68EOcR26Y",
//       prompt:
//         "young japanese man dominates a lion. roaring lion. side view. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/1YrdTuRkz4g",
//       prompt:
//         "young asian islander man. lonely. holding a lantern. holding a walking stick. sideview looking at camera. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/uGgij0MscmE",
//       prompt:
//         "young asian man. wheel of fortune. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/4-O2b7on1ZY",
//       prompt:
//         "young asian man. justice is served. scales and a sword. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/Kr8h6LfuDT8",
//       prompt:
//         "a young asian man hanging upside down in meditation. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/ORVPCj7vPHA",
//       prompt:
//         "a young asian man in armor riding a horse. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/3ukAefnlJLc",
//       prompt:
//         "a young asian adult male angel. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/va2QeHsgKcY",
//       prompt:
//         "a young adult asian male devil. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/2_W37X3f_i0",
//       prompt:
//         "a burning tower. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/77IjSoYv13A",
//       prompt:
//         "a young adult asian male. Star theme. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/qwEjfgHiANU",
//       prompt:
//         "a young adult asian male angel in the sky. Moon theme. photorealistic details. tarot card. --ar 1:2",
//     },
//     {
//       img: "https://s.mj.run/qwEjfgHiANU",
//       prompt:
//         "a young adult asian male angel in the sky. photorealistic details. tarot card. --ar 1:2",
//     },
//     {
//       img: "https://s.mj.run/_N4vUWFNqUY",
//       prompt:
//         "a young adult asian male. sun theme. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//     {
//       img: "https://s.mj.run/6RVIi7MYdeY",
//       prompt:
//         "a young adult asian man encircled by the world. photorealistic details. tarot card. --ar 1:2 --style raw",
//     },
//   ];
//   const processedPrompts = promptsData.map((item) => ({
//     img: item.img,
//     prompt: replacePlaceholders(item.prompt),
//   }));
//   try {
//     await Prompt.deleteMany();
//     await Prompt.insertMany(processedPrompts);
//
//     res.status(200).json({ message: "Prompts updated successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating prompts", error });
//   }
// });
router.post("/multi", async (req, res) => {
  try {
    const { ethnicity, gender, prompts } = req.body;
    console.log(req.body);
    const processedSinglePrompt = prompts[0].prompt
      .replace(/{ethnicity}/g, ethnicity)
      .replace(/{gender}/g, gender);
    console.log(processedSinglePrompt);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        prompt: `https://i.ibb.co/3TR9Vxj/images-1.jpg ${processedSinglePrompt}`,
        aspect_ratio: "1:2",
        process_mode: "relax",
        webhook_endpoint: "",
        webhook_secret: "",
      },
      url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
      method: "post",
    };

    const answer = await axios(config);
    const response = answer.data;
    const taskResult = await CheckProgress(response.task_id);
    const id = taskResult.task_id;
    if (taskResult.status === "finished") {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          origin_task_id: `${id}`,
          index: `1`,
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
        method: "post",
      };
      const answer = await axios(config);
      const response = answer.data;

      const taskResult2 = await CheckProgress(response.task_id);
      if (taskResult2.status === "finished") {
        res.status(200).json([
          {
            status: taskResult2.status,
            task_id: taskResult2.task_id,
            uri: taskResult2.task_result.image_url,
            process_time: taskResult2.process_time,
          },
        ]);
      }
    } else {
      res.status(400).json({
        message: "Error in Upscaling",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});
router.post("/multi2", async (req, res) => {
  try {
    const { ethnicity, gender, prompts } = req.body;
    console.log(req.body);

    // Function to make a request with a dynamic prompt
    const makeRequestWithDynamicPrompt = async (prompt) => {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          prompt: `https://i.ibb.co/3TR9Vxj/images-1.jpg ${prompt}`,
          aspect_ratio: "1:2",
          process_mode: "relax",
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
        method: "post",
      };

      const answer = await axios(config);
      const response = answer.data;
      const taskResult = await CheckProgress(response.task_id);
      return taskResult;
    };

    // Process prompts by replacing placeholders
    const processedPrompts = prompts.map((prompt) =>
      prompt.prompt
        .replace(/{ethnicity}/g, ethnicity)
        .replace(/{gender}/g, gender),
    );

    // Make requests for each prompt
    const taskPromises = processedPrompts.map((prompt) =>
      makeRequestWithDynamicPrompt(prompt),
    );

    // Wait for all requests to finish
    const taskResults = await Promise.all(taskPromises);

    // Check if all tasks are finished
    const allTasksFinished = taskResults.every(
      (task) => task.status === "finished",
    );

    if (allTasksFinished) {
      // If all tasks are finished, send the results
      const responseData = taskResults.map((taskResult, index) => ({
        status: taskResult.status,
        task_id: taskResult.task_id,
        uri: taskResult.task_result.image_url,
        process_time: taskResult.process_time,
        prompt: prompts[index],
      }));
      res.status(200).json(responseData);
    } else {
      res.status(202).json({
        message: "At least one task is still processing",
        taskResults: taskResults.map((taskResult, index) => ({
          status: taskResult.status,
          task_id: taskResult.task_id,
          prompt: prompts[index],
        })),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

router.post("/upscale", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        origin_task_id: `${body.messageId}`,
        index: `${body.upscale}`,
        webhook_endpoint: "",
        webhook_secret: "",
      },
      url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
      method: "post",
    };
    const answer = await axios(config);
    const response = answer.data;

    const taskResult = await CheckProgress(response.task_id);
    if (taskResult.status === "finished") {
      res.status(200).json({
        status: taskResult.status,
        task_id: taskResult.task_id,
        uri: taskResult.task_result.image_url,
        process_time: taskResult.process_time,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occured",
      error: error.message,
    });
  }
});

router.post("/edit", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        prompt: `${body.imgUrl} ${body.prompt}`,
        aspect_ratio: "1:2",
        process_mode: "relax",
        webhook_endpoint: "",
        webhook_secret: "",
      },
      url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
      method: "post",
    };

    const answer = await axios(config);
    const response = answer.data;
    console.log(response);
    const taskResult = await CheckProgress(response.task_id);
    const id = taskResult.task_id;
    if (taskResult.status === "finished") {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          origin_task_id: `${id}`,
          index: `1`,
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
        method: "post",
      };
      const answer = await axios(config);
      const response = answer.data;

      const taskResult2 = await CheckProgress(response.task_id);
      if (taskResult2.status === "finished") {
        res.status(200).json({
          status: taskResult2.status,
          task_id: taskResult2.task_id,
          uri: taskResult2.task_result.image_url,
          process_time: taskResult2.process_time,
        });
      }
    } else {
      res.status(400).json({
        message: "Error in Upscaling",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

router.post("/faceswap", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const config = {
      headers: {
        "X-API-KEY": token,
        "Content-Type": "application/json",
      },
      method: "post",
      url: "https://api.goapi.xyz/api/face_swap/v1/async",
      data: {
        target_image: `${body.target}`,
        swap_image: `${body.source}`,
        result_type: "url",
      },
    };

    const answer = await axios(config);
    const task_id = answer.data.data.task_id;
    const taskResult = await checkProgressSwap(task_id);
    if (taskResult.data.status === "success") {
      res.status(200).json({
        status: taskResult.status,
        uri: taskResult.data.image,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

module.exports = router;
