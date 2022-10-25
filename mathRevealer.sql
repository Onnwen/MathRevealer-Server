CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(50),
  `last_name` varchar(50),
  `hashed_password` varchar(256),
  `email` varchar(62),
  `creation_date` datetime
);

CREATE TABLE `chronology` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `search` varchar(255),
  `date` datetime
);

CREATE TABLE `tokens` (
  `token` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `expire` datetime
);

ALTER TABLE `chronology` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
