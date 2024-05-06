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

router.post("/create2", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const makeRequest = async () => {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          prompt: body.prompt,
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

    const task1Promise = makeRequest();
    // const task2Promise = makeRequest();

    const [taskResult1] = await Promise.all([
      task1Promise,
      // task2Promise,
    ]);
    if (
      taskResult1.status === "finished"
      // taskResult2.status === "finished"
    ) {
      res.status(200).json([
        {
          status: taskResult1.status,
          task_id: taskResult1.task_id,
          uri: taskResult1.task_result.image_url,
          process_time: taskResult1.process_time,
        },
        // {
        //   status: taskResult2.status,
        //   task_id: taskResult2.task_id,
        //   uri: taskResult2.task_result.image_url,
        //   process_time: taskResult2.process_time,
        // },
      ]);
    } else {
      res.status(202).json([
        {
          message: "At least one task is still processing",
          status1: taskResult1.status,
          // status2: taskResult2.status,
        },
      ]);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

router.post("/multi", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);

    const getPromptsWithDynamicElements = async () => {
      const promptsFromDB = await Prompt.find();
      if (!promptsFromDB || promptsFromDB.length === 0) {
        throw new Error("No prompts found in database");
      }
      return promptsFromDB.map((promptObj) => ({
        prompt: promptObj.prompt
          .replace(/{ethnicity}/g, body.ethnicity)
          .replace(/{gender}/g, body.gender),
      }));
    };

    console.log(getPromptsWithDynamicElements);

    // Make request function with dynamic prompts
    const makeRequestWithDynamicPrompt = async (prompt) => {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          prompt: prompt,
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

    // Get prompts from the database
    const prompts = await getPromptsWithDynamicElements();

    // Make requests for each prompt
    const taskPromises = prompts.map((promptObj) =>
      makeRequestWithDynamicPrompt(promptObj.prompt),
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
        prompt: prompts[index].prompt,
      }));
      res.status(200).json(responseData);
    } else {
      res.status(202).json({
        message: "At least one task is still processing",
        taskResults: taskResults.map((taskResult) => ({
          status: taskResult.status,
          task_id: taskResult.task_id,
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
