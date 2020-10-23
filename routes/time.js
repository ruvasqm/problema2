var express = require("express");
var router = express.Router();
var timezones = require("../timezones.json");
var timezonesOffsets = timezones.map((tz) => {
  return tz.offset;
});
/* POST time */
router.post("/", function (req, res, next) {
  let validatedTime = validateParams(req.body.time, req.body.offset);
  if (!req.body.time || !req.body.offset || !validatedTime)
    res.status(400).send({
      response: { status: 400, error: "Parameter(s) omitted or invalid" },
    });
  else {
    res
      .status(200)
      .send({ response: { time: validatedTime, timezone: "utc" } });
  }
});

function validateParams(time, offset) {
  const validOffset = timezonesOffsets.includes(parseFloat(offset))
    ? parseFloat(offset)
    : null;
  const validTime = validateTime(time);
  if (validOffset == null || validTime == null) return null;
  return addTime(validTime, validOffset);
}

function validateTime(time) {
  try {
    let [hours, mins, secs, ms] = time.split(":");
    [hours, mins, secs, ms] = [
      parseInt(hours),
      parseInt(mins),
      parseInt(secs),
      parseInt(ms),
    ];
    if (isNaN(hours) || hours < 0 || hours > 23) throw "Invalid Hour";
    if (isNaN(mins) || mins < 0 || mins > 23) throw "Invalid Minutes";
    if (isNaN(secs) || secs < 0 || secs > 59) throw "Invalid Seconds";

    return secs + mins * 60 + hours * 3600;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function addTime(time, offset) {
  // validation delegated to previous functions
  let adjustedTime = time + offset * 3600;
  if (adjustedTime >= 24 * 3600) adjustedTime -= 24 * 3600;
  else if (adjustedTime < 0) adjustedTime += 24 * 3600;

  let [hours, mins, secs] = [
    ((adjustedTime - (adjustedTime % 3600)) / 3600).toString(),
    (((adjustedTime % 3600) - ((adjustedTime % 3600) % 60)) / 60).toString(),
    ((adjustedTime % 3600) % 60).toString(),
  ];

  return [hours, mins, secs].join(":");
}
module.exports = router;
